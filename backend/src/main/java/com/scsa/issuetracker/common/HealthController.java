package com.scsa.issuetracker.common;

import java.util.Map;

import io.swagger.v3.oas.annotations.Operation;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

	@Operation(summary = "헬스체크", description = "백엔드 서버가 정상 실행 중인지 확인합니다.")
	@GetMapping("/api/health")
	public Map<String, String> health() {

		return Map.of("status", "ok");
	}
}
