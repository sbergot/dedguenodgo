package oadam;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.util.Arrays;
import java.util.logging.Logger;

import com.googlecode.objectify.Key;
import com.googlecode.objectify.ObjectifyService;
import com.googlecode.objectify.annotation.Entity;
import com.googlecode.objectify.annotation.Id;

@Entity
public class AdminPassword {
	private static final String UNIQUE_ID = "adminPassword";

	static {
		ObjectifyService.register(AdminPassword.class);
	}
	
	@Id String id = UNIQUE_ID;
	byte[] hashedPassword;
	byte[] passwordSalt;
	
	public static boolean checkAdminPassword(String password) {
		AdminPassword adminPassword = ofy().load().key(Key.create(AdminPassword.class, UNIQUE_ID)).now();
		if (adminPassword == null) {
			Logger.getAnonymousLogger().info("Registering the received password as the sole admin password of the app");
			adminPassword = new AdminPassword();
			adminPassword.passwordSalt = Party.generateRandomSalt();
			adminPassword.hashedPassword = Party.hashPassword(password, adminPassword.passwordSalt);
			ofy().save().entity(adminPassword).now();
		}
		return Arrays.equals(adminPassword.hashedPassword, Party.hashPassword(password, adminPassword.passwordSalt));
	}
	
}
