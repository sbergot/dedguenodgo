package oadam.resources.authenticated;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;

import oadam.Party;
import oadam.User;
import oadam.security.SecurityFilter;

import com.googlecode.objectify.Key;
import com.googlecode.objectify.ObjectifyService;

@Path("user")
public class UserResource {
	static {
		ObjectifyService.register(Party.class);
		ObjectifyService.register(User.class);
	}
	
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Map<Long, User> getUsers(@Context HttpServletRequest request) {
		String partyId = SecurityFilter.getPartyId(request);
		return getUsers(partyId);
	}

	public Map<Long, User> getUsers(String partyId) {
		Key<Party> ancestor = Key.create(Party.class, partyId);
		Map<Long, User> result = new HashMap<>();
		List<User> asList = ofy().load().type(User.class).ancestor(ancestor).list();
		for (User u: asList) {
			if (!u.deleted) {
				result.put(u.id, u);
			}
		}
		return result;
	}
	
	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public User addUser(@Context HttpServletRequest request, User added) {
		if (added.id != null) {
			throw new IllegalArgumentException("cannot specify an id when created. Received " + added.id);
		}
		String partyId = SecurityFilter.getPartyId(request);
		Key<Party> ancestor = Key.create(Party.class, partyId);
		added.parent = ancestor;
		ofy().save().entity(added).now();
		return added;
	}
	
	@DELETE @Path("{id}")
	public void deleteUser(@Context HttpServletRequest request, @PathParam("id") long id) {
		String partyId = SecurityFilter.getPartyId(request);
		Key<Party> ancestor = Key.create(Party.class, partyId);
		User user = ofy().load().key(Key.create(ancestor, User.class, id)).now();
		user.deleted = true;
		ofy().save().entity(user);
	}
	
	
}
