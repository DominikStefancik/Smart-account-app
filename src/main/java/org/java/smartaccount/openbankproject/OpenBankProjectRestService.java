package org.java.smartaccount.openbankproject;

import org.java.smartaccount.auth.AuthenticationService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@Service
public class OpenBankProjectRestService {
	@Value("${obp.api.versionedUrl}")
	private String versionedUrl;

	@Value("${obp.username}")
	private String username;

	@Value("${obp.password}")
	private String password;

	private final AuthenticationService authenticationService;

	public Object getAccount(String bankId, String accountId) {
		log.info("Getting account bankId={}, accountId={}", bankId, accountId);
		RestTemplate restTemplate = new RestTemplate();
		final String token = authenticationService.login(username, password);
		HttpEntity<Void> req = prepareAuthRequest(token);
		String accountDetailsUrl = String.format("%s/my/banks/%s/accounts/%s/account", versionedUrl,
				bankId, accountId);
		return restTemplate.exchange(accountDetailsUrl, HttpMethod.GET, req, Object.class).getBody();
	}

	public Object getAccounts() {
		log.info("Getting all accounts");
		RestTemplate restTemplate = new RestTemplate();
		final String token = authenticationService.login(username, password);
		HttpEntity<Void> req = prepareAuthRequest(token);
		String accountsUrl = String.format("%s/my/accounts", versionedUrl);
		return restTemplate.exchange(accountsUrl, HttpMethod.GET, req, Object.class).getBody();
	}

	private HttpEntity<Void> prepareAuthRequest(String token) {
		HttpHeaders authHeaders = new HttpHeaders();
		String dlHeader = String.format("DirectLogin token=%s", token);
		authHeaders.add(HttpHeaders.AUTHORIZATION, dlHeader);
		return new HttpEntity<>(null, authHeaders);
	}
}
