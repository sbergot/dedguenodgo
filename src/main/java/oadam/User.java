package oadam;

public class User {
	public Long id;
	public String name;
	
	public static final User olivier = new User(1L, "Olivier");
	public static final User elisa = new User(2L, "Elisabeth");
	public static final User nicolas = new User(3L, "Nicolas");
	
	public User(Long id, String name) {
		super();
		this.id = id;
		this.name = name;
	}
	
	public User() {
	}
}
