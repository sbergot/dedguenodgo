package oadam.resources;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import oadam.User;

@Path("user")
public class UserResource {
	
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Map<Long, User> getUsers() {
		Map<Long, User> result = new HashMap<>();
		for (User u: Arrays.asList(User.olivier, User.elisa, User.nicolas)) {
			result.put(u.id, u);
		}
		return result;
	}
}
