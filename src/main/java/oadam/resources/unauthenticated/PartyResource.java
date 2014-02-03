package oadam.resources.unauthenticated;

import static com.googlecode.objectify.ObjectifyService.ofy;

import javax.ws.rs.FormParam;
import javax.ws.rs.POST;
import javax.ws.rs.Path;

import oadam.AdminPassword;
import oadam.Party;

import com.googlecode.objectify.ObjectifyService;

@Path("party")
public class PartyResource {
	static {
		ObjectifyService.register(Party.class);
	}
	
	public Party getParty(String id) {
		if (id == null) {
			throw new NullPointerException("received a null partyId");
		}
		return ofy().load().type(Party.class).id(id).now();
	}
	
	@POST
	public void createParty(@FormParam("adminPassword") String adminPassword, @FormParam("partyName") String partyName, @FormParam("partyPassword")  String partyPassword) {
		boolean checkAdminPassword = AdminPassword.checkAdminPassword(adminPassword);
		if (!checkAdminPassword) {
			throw new IllegalArgumentException("admin password is wrong");
		}
		Party party = new Party();
		party.id = partyName;
		party.setPassword(partyPassword);
		ofy().save().entity(party);
	}
}
