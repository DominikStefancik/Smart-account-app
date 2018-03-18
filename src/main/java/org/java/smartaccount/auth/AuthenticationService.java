package org.java.smartaccount.auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class AuthenticationService {
	@Value("${obp.api.directLoginUrl}")
	private String directLoginUrl;

	@Value("${obp.consumerKey}")
	private String consumerKey;

	public String login(String username, String password) {
		log.info("Logging user {}", username);
		RestTemplate restTemplate = new RestTemplate();
		String dlData = String.format("DirectLogin username=%s,password=%s,consumer_key=%s", username,
				password, consumerKey);
		HttpHeaders authHeaders = new HttpHeaders();
		authHeaders.add(HttpHeaders.AUTHORIZATION, dlData);
		authHeaders.add(HttpHeaders.CONTENT_TYPE, "application/json");
		HttpEntity<Void> req = new HttpEntity<>(null, authHeaders);
		ResponseEntity<Token> response = restTemplate.exchange(directLoginUrl, HttpMethod.POST, req,
				Token.class);
		log.info("User logged, token={}", response.getBody().getToken());
		return response.getBody().getToken();
	}

	@Data
	private static class Token {
		private String token;
	}
}
