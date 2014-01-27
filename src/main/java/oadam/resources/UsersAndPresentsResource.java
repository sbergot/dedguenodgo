package oadam.resources;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import oadam.Party;
import oadam.Present;
import oadam.User;

import com.googlecode.objectify.ObjectifyService;
import com.googlecode.objectify.impl.translate.opt.joda.JodaTimeTranslators;

@Path("users-and-presents")
public class UsersAndPresentsResource {
	static {
		JodaTimeTranslators.add(ObjectifyService.factory());
		ObjectifyService.register(Party.class);
		ObjectifyService.register(User.class);
		ObjectifyService.register(Present.class);
	}
	
	public static class UsersAndPresents {
		public Map<Long, User> users;
		public List<Present> presents;
		public UsersAndPresents() {
		}
		public UsersAndPresents(Map<Long, User> users, List<Present> presents) {
			super();
			this.users = users;
			this.presents = presents;
		}
	}
	
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public UsersAndPresents getUsersAndPresents() {
		Map<Long, User> users = new HashMap<>();
		for (User u: Arrays.asList(User.olivier, User.elisa, User.nicolas)) {
			users.put(u.id, u);
		}
		List<Present> presents = ofy().load().type(Present.class).ancestor(Party.FAMILLE_AD).list();
		return new UsersAndPresents(users, presents);
	}
}
