package oadam.resources.authenticated;

import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;

import oadam.Present;
import oadam.User;

@Path("users-and-presents")
public class UsersAndPresentsResource {
	UserResource userResource = new UserResource();
	PresentResource presentResource = new PresentResource();
	
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
	public UsersAndPresents getUsersAndPresents(@Context HttpServletRequest request) {
		Map<Long, User> users = userResource.getUsers(request);
		List<Present> presents = presentResource.getPresents(request);
		return new UsersAndPresents(users, presents);
	}
}
