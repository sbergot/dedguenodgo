package oadam.resources;

import java.util.Arrays;
import java.util.List;

import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import org.joda.time.DateTime;

import oadam.Present;
import oadam.User;

@Path("present")
public class PresentResource {
	
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public List<Present> getPresents() {
		return Arrays.asList(
				new Present(10L, "Livre", "un livre sympa", User.olivier.id, User.olivier.id, new DateTime(), null, null, null),
				new Present(10L, "Diamants", "des diamants de mocassa", User.elisa.id, User.olivier.id, new DateTime(), User.olivier.id, new DateTime(), null)
		);
	}
	
	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Present addPresent(Present added) {
		added.id = Math.round(Math.random()*1e14);
		return added;
	}
	
	@PUT @Path("{id}")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Present editPresent(@PathParam("id") long id, Present edited) {
		return edited;
	}
	
	
}
