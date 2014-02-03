package oadam.resources.unauthenticated;

import java.util.Collection;
import java.util.Map;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;

import oadam.Party;
import oadam.User;
import oadam.resources.authenticated.UserResource;

@Path("party-users")
public class PartyUsersResource {
	
	PartyResource partyResource = new PartyResource();
	UserResource userResource = new UserResource();
	
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Collection<User> getPartyUsers(@QueryParam("id") String id, @QueryParam("password") String password) {
		Party party = partyResource.getParty(id);
		if (party == null || !party.checkPassword(password)) {
			return null;
		} else {
			Map<Long, User> asMap = userResource.getUsers(id);
			return asMap.values();
		}
	}
}
