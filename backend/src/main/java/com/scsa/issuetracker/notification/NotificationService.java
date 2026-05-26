package com.scsa.issuetracker.notification;

import com.scsa.issuetracker.global.exception.BusinessException;
import com.scsa.issuetracker.global.exception.ErrorCode;
import com.scsa.issuetracker.global.security.SecurityUtil;
import com.scsa.issuetracker.notification.dto.NotificationPageResponse;
import com.scsa.issuetracker.notification.dto.NotificationResponse;
import jakarta.persistence.EntityManager;
import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final EntityManager entityManager;

    public NotificationPageResponse getMyNotifications(boolean unreadOnly, int limit, int offset) {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        String unreadCondition = unreadOnly ? "and notification.readAt is null" : "";

        List<Notification> notifications = entityManager.createQuery(
                        """
                                select notification
                                from Notification notification
                                where notification.receiverId = :receiverId
                                %s
                                order by notification.createdAt desc
                                """.formatted(unreadCondition),
                        Notification.class
                )
                .setParameter("receiverId", currentUserId)
                .setFirstResult(offset)
                .setMaxResults(limit)
                .getResultList();

        long total = unreadOnly
                ? notificationRepository.countByReceiverIdAndReadAtIsNull(currentUserId)
                : notificationRepository.countByReceiverId(currentUserId);
        long unreadTotal = notificationRepository.countByReceiverIdAndReadAtIsNull(currentUserId);

        return NotificationPageResponse.of(
                notifications.stream().map(NotificationResponse::from).toList(),
                total,
                unreadTotal
        );
    }

    @Transactional
    public NotificationResponse markAsRead(Long notificationId) {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        Notification notification = notificationRepository.findByIdAndReceiverId(notificationId, currentUserId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOTIFICATION_NOT_FOUND));

        notification.markAsRead();
        return NotificationResponse.from(notification);
    }

    @Transactional
    public void markAllAsRead() {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        notificationRepository.findByReceiverIdAndReadAtIsNull(currentUserId)
                .forEach(Notification::markAsRead);
    }

    @Transactional
    public void notifyIssueAssigned(Long projectId, Long issueId, Long actorId, Long receiverId) {
        create(
                receiverId,
                actorId,
                projectId,
                issueId,
                null,
                NotificationType.ISSUE_ASSIGNED,
                "이슈 담당자로 지정되었습니다."
        );
    }

    @Transactional
    public void notifyIssueStatusChanged(
            Long projectId,
            Long issueId,
            Long actorId,
            Collection<Long> receiverIds,
            String status
    ) {
        createAll(
                receiverIds,
                actorId,
                projectId,
                issueId,
                null,
                NotificationType.ISSUE_STATUS_CHANGED,
                "이슈 상태가 " + status + "(으)로 변경되었습니다."
        );
    }

    @Transactional
    public void notifyCommentCreated(
            Long projectId,
            Long issueId,
            Long commentId,
            Long actorId,
            Collection<Long> receiverIds
    ) {
        createAll(
                receiverIds,
                actorId,
                projectId,
                issueId,
                commentId,
                NotificationType.COMMENT_CREATED,
                "이슈에 새 댓글이 작성되었습니다."
        );
    }

    @Transactional
    public void notifyReplyCreated(
            Long projectId,
            Long issueId,
            Long commentId,
            Long actorId,
            Long receiverId
    ) {
        create(
                receiverId,
                actorId,
                projectId,
                issueId,
                commentId,
                NotificationType.REPLY_CREATED,
                "내 댓글에 답글이 작성되었습니다."
        );
    }

    @Transactional
    public void notifyReactionAdded(
            Long projectId,
            Long issueId,
            Long commentId,
            Long actorId,
            Long receiverId
    ) {
        create(
                receiverId,
                actorId,
                projectId,
                issueId,
                commentId,
                NotificationType.REACTION_ADDED,
                "내 글에 새 반응이 추가되었습니다."
        );
    }

    private void createAll(
            Collection<Long> receiverIds,
            Long actorId,
            Long projectId,
            Long issueId,
            Long commentId,
            NotificationType notificationType,
            String message
    ) {
        Set<Long> uniqueReceiverIds = new LinkedHashSet<>(receiverIds);
        uniqueReceiverIds.forEach(receiverId -> create(
                receiverId,
                actorId,
                projectId,
                issueId,
                commentId,
                notificationType,
                message
        ));
    }

    private void create(
            Long receiverId,
            Long actorId,
            Long projectId,
            Long issueId,
            Long commentId,
            NotificationType notificationType,
            String message
    ) {
        if (receiverId == null || receiverId.equals(actorId)) {
            return;
        }

        Notification notification = Notification.of(
                receiverId,
                actorId,
                projectId,
                issueId,
                commentId,
                notificationType,
                message
        );
        notificationRepository.save(notification);
    }
}
