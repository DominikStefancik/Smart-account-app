package org.java.smartaccount;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("sa")
public class SmartAccountController {
	@RequestMapping(value = "/passcode", method = RequestMethod.POST)
	public ResponseEntity<?> postPassword() {
		return ResponseEntity.ok().build();
	}

	@RequestMapping(value = "/financies", method = RequestMethod.GET)
	public ResponseEntity<?> getFinancialSituation() {
		String situation = "You currently have 10241 Euro, 3820 Euro on your Deutsche Bank account and 6421 Euro on your DKB account.";
		return ResponseEntity.ok(situation);
	}

	@RequestMapping(value = "/transferToSon", method = RequestMethod.POST)
	public ResponseEntity<?> transferMoneyToSon() {
		String answer = "I transfered 50 Eur to Peter. You still have 10191 Euro on your current account.";
		return ResponseEntity.ok(answer);
	}

	@RequestMapping(value = "/transferToDKB", method = RequestMethod.POST)
	public ResponseEntity<?> transferMoneyToDKB() {
		String answer = "Roger that. Your new account balance is 8191 Euro.";
		return ResponseEntity.ok(answer);
	}
}
