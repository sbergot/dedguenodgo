package oadam.resources;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import oadam.Party;
import oadam.User;

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
	public Map<Long, User> getUsers() {
		Map<Long, User> result = new HashMap<>();
		List<User> asList = ofy().load().type(User.class).ancestor(Party.FAMILLE_AD).list();
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
	public User addUser(User added) {
		if (added.id != null) {
			throw new IllegalArgumentException("cannot specify an id when created. Received " + added.id);
		}
		ofy().save().entity(added).now();
		return added;
	}
	
	@DELETE @Path("{id}")
	public void deleteUser(@PathParam("id") long id) {
		Key<Party> parentKey = Key.create(Party.class, Party.FAMILLE_AD.id);
		User user = ofy().load().key(Key.create(parentKey, User.class, id)).now();
		user.deleted = true;
		ofy().save().entity(user);
	}
	
	
}
