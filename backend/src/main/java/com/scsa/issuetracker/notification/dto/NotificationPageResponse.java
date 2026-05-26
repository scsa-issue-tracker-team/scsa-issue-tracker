package com.scsa.issuetracker.notification.dto;

import java.util.List;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class NotificationPageResponse {

    private List<NotificationResponse> items;
    private long total;
    private long unreadTotal;

    public static NotificationPageResponse of(
            List<NotificationResponse> items,
            long total,
            long unreadTotal
    ) {
        return NotificationPageResponse.builder()
                .items(items)
                .total(total)
                .unreadTotal(unreadTotal)
                .build();
    }
}
