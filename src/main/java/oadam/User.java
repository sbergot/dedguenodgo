package oadam;

import org.codehaus.jackson.annotate.JsonIgnoreProperties;

import com.googlecode.objectify.Key;
import com.googlecode.objectify.annotation.Entity;
import com.googlecode.objectify.annotation.Id;
import com.googlecode.objectify.annotation.Parent;

@Entity
@JsonIgnoreProperties({"parent"})
public class User {
	@Id public Long id;
	@Parent public Key<Party> parent = Key.create(Party.class, Party.FAMILLE_AD.id);
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
