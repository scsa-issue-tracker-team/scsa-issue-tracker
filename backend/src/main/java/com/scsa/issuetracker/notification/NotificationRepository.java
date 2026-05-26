package com.scsa.issuetracker.notification;

import java.util.Optional;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Page<Notification> findByReceiverIdOrderByCreatedAtDesc(Long receiverId, Pageable pageable);

    Page<Notification> findByReceiverIdAndReadAtIsNullOrderByCreatedAtDesc(Long receiverId, Pageable pageable);

    Optional<Notification> findByIdAndReceiverId(Long id, Long receiverId);

    List<Notification> findByReceiverIdAndReadAtIsNull(Long receiverId);

    long countByReceiverId(Long receiverId);

    long countByReceiverIdAndReadAtIsNull(Long receiverId);
}
