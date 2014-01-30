package oadam;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Arrays;
import java.util.Random;

import com.googlecode.objectify.annotation.Entity;
import com.googlecode.objectify.annotation.Id;
import com.sun.jersey.core.util.Base64;

@Entity
public class Party {
	public static MessageDigest md;
	static {
		try {
			md = MessageDigest.getInstance("SHA-1");
		} catch (NoSuchAlgorithmException e) {
			throw new IllegalStateException("sha-1 must be present");
		}
	}
	
	
	@Id public String id;
	public byte[] hashedPassword;
	public byte[] passwordSalt;
	
	public void setPassword(String password) {
		passwordSalt = generateRandomSalt();
		hashedPassword = hashPassword(password, passwordSalt);
	}

	public boolean checkPassword(String attempt) {
		byte[] hashedAttempt = hashPassword(attempt, passwordSalt);
		return Arrays.equals(hashedPassword, hashedAttempt);
	}

	public static byte[] generateRandomSalt() {
		byte[] toto = new byte[20];
		new Random().nextBytes(toto);
		return toto;
	}
	
	public static byte[] hashPassword(String password, byte[] salt) {
		byte[] base64 = Base64.encode(password);
		byte[] concat = new byte[base64.length + salt.length];
		System.arraycopy(base64, 0, concat, 0, base64.length);
		System.arraycopy(salt, 0, concat, base64.length, salt.length);
		
		byte[] toto = md.digest(concat);
		return toto;
	}
}
