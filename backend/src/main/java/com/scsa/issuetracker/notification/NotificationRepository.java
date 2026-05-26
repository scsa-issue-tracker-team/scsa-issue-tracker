package com.scsa.issuetracker.notification;

import java.util.Optional;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Optional<Notification> findByIdAndReceiverId(Long id, Long receiverId);

    List<Notification> findByReceiverIdAndReadAtIsNullAndDeletedAtIsNull(Long receiverId);

    long countByReceiverIdAndReadAtIsNullAndDeletedAtIsNull(Long receiverId);
}
