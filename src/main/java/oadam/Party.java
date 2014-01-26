package oadam;

import com.googlecode.objectify.annotation.Entity;
import com.googlecode.objectify.annotation.Id;

@Entity
public class Party {
	public static final Party FAMILLE_AD;

	static {
		FAMILLE_AD = new Party();
		FAMILLE_AD.id = "famillead";
		FAMILLE_AD.locale = "fr";
	}
	
	@Id public String id;
	public String locale;
	
}
