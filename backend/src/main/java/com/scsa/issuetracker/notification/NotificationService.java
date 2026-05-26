package com.scsa.issuetracker.notification;

import com.scsa.issuetracker.global.exception.BusinessException;
import com.scsa.issuetracker.global.exception.ErrorCode;
import com.scsa.issuetracker.global.security.SecurityUtil;
import com.scsa.issuetracker.notification.dto.NotificationPageResponse;
import com.scsa.issuetracker.notification.dto.NotificationResponse;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
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

    public NotificationPageResponse getMyNotifications(
            Boolean read,
            boolean unreadOnly,
            NotificationType notificationType,
            Long projectId,
            int limit,
            int offset
    ) {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        Boolean selectedRead = unreadOnly ? Boolean.FALSE : read;
        StringBuilder query = new StringBuilder("""
                select notification
                from Notification notification
                where notification.receiverId = :receiverId
                  and notification.deletedAt is null
                """);

        appendFilters(query, selectedRead, notificationType, projectId);
        query.append(" order by notification.createdAt desc");

        TypedQuery<Notification> notificationQuery = entityManager.createQuery(query.toString(), Notification.class);
        bindFilters(notificationQuery, currentUserId, notificationType, projectId);

        List<Notification> notifications = notificationQuery
                .setFirstResult(offset)
                .setMaxResults(limit)
                .getResultList();

        long total = countMyNotifications(currentUserId, selectedRead, notificationType, projectId);
        long unreadTotal = notificationRepository.countByReceiverIdAndReadAtIsNullAndDeletedAtIsNull(currentUserId);

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
        notificationRepository.findByReceiverIdAndReadAtIsNullAndDeletedAtIsNull(currentUserId)
                .forEach(Notification::markAsRead);
    }

    @Transactional
    public void deleteNotification(Long notificationId) {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        Notification notification = notificationRepository.findByIdAndReceiverId(notificationId, currentUserId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOTIFICATION_NOT_FOUND));

        notification.delete();
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

    private long countMyNotifications(
            Long receiverId,
            Boolean read,
            NotificationType notificationType,
            Long projectId
    ) {
        StringBuilder query = new StringBuilder("""
                select count(notification)
                from Notification notification
                where notification.receiverId = :receiverId
                  and notification.deletedAt is null
                """);

        appendFilters(query, read, notificationType, projectId);

        TypedQuery<Long> countQuery = entityManager.createQuery(query.toString(), Long.class);
        bindFilters(countQuery, receiverId, notificationType, projectId);

        return countQuery.getSingleResult();
    }

    private void appendFilters(
            StringBuilder query,
            Boolean read,
            NotificationType notificationType,
            Long projectId
    ) {
        if (read != null && read) {
            query.append(" and notification.readAt is not null");
        }
        if (read != null && !read) {
            query.append(" and notification.readAt is null");
        }
        if (notificationType != null) {
            query.append(" and notification.notificationType = :notificationType");
        }
        if (projectId != null) {
            query.append(" and notification.projectId = :projectId");
        }
    }

    private void bindFilters(
            TypedQuery<?> query,
            Long receiverId,
            NotificationType notificationType,
            Long projectId
    ) {
        query.setParameter("receiverId", receiverId);
        if (notificationType != null) {
            query.setParameter("notificationType", notificationType);
        }
        if (projectId != null) {
            query.setParameter("projectId", projectId);
        }
    }
}
