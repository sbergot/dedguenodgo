package dedguenodgo;

import static org.junit.Assert.*;
import oadam.Party;

import org.junit.Test;

public class TestSecurity {
	@Test
	public void passwordHashing() {
		Party party = new Party();
		party.setPassword("tototata");
		assertEquals("hashed password is recognized", true, party.checkPassword("tototata"));
	}
}
