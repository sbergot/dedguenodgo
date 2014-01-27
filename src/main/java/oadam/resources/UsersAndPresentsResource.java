package oadam.resources;

import java.util.List;
import java.util.Map;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
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
	public UsersAndPresents getUsersAndPresents() {
		Map<Long, User> users = userResource.getUsers();
		List<Present> presents = presentResource.getPresents();
		return new UsersAndPresents(users, presents);
	}
}
