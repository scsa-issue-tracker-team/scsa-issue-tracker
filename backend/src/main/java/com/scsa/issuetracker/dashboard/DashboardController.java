package com.scsa.issuetracker.dashboard;

import com.scsa.issuetracker.dashboard.dto.DashboardActivityDailyResponse;
import io.swagger.v3.oas.annotations.Operation;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @Operation(summary = "My daily activity counts")
    @GetMapping("/activity-daily")
    public ResponseEntity<List<DashboardActivityDailyResponse>> getMyActivityDaily(
            @RequestParam(required = false, defaultValue = "84") Integer days
    ) {
        return ResponseEntity.ok(dashboardService.getMyActivityDaily(days));
    }
}
