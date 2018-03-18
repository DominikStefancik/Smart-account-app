package org.java.smartaccount.openbankproject;

import java.util.Arrays;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@RestController
@RequestMapping("obp")
public class AccountController {
	private final OpenBankProjectRestService restService;

	@RequestMapping(value = "/account/{bankId}/{accountId}", method = RequestMethod.GET)
	public ResponseEntity<?> getAccount(@PathVariable("bankId") String bankId,
			@PathVariable("accountId") String accountId) {
		Object account = restService.getAccount(bankId, accountId);
		return ResponseEntity.ok(account);
	}

	@RequestMapping(value = "/accounts", method = RequestMethod.GET)
	public ResponseEntity<?> getAllAccounts() {
		Object account = restService.getAccounts();
		return ResponseEntity.ok(account);
	}

	@RequestMapping(value = "/financies", method = RequestMethod.GET)
	public ResponseEntity<?> getFinancies() {
		Object account1 = restService.getAccount("at02-bank-x--01", "100001");
		Object account2 = restService.getAccount("at02-bank-y--01", "100001");
		return ResponseEntity.ok(Arrays.asList(account1, account2));
	}
}
