package oadam.resources.authenticated;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;

import oadam.Party;
import oadam.Present;
import oadam.security.SecurityFilter;

import com.googlecode.objectify.Key;
import com.googlecode.objectify.ObjectifyService;
import com.googlecode.objectify.impl.translate.opt.joda.JodaTimeTranslators;

@Path("present")
public class PresentResource {
	static {
		JodaTimeTranslators.add(ObjectifyService.factory());
		ObjectifyService.register(Party.class);
		ObjectifyService.register(Present.class);
	}
	
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public List<Present> getPresents(@Context HttpServletRequest request) {
		String partyId = SecurityFilter.getPartyId(request);
		Key<Party> ancestor = Key.create(Party.class, partyId);
		return ofy().load().type(Present.class).ancestor(ancestor).list();
	}
	
	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Present addPresent(@Context HttpServletRequest request, Present added) {
		if (added.id != null) {
			throw new IllegalArgumentException("cannot specify an id when created. Received " + added.id);
		}
		String partyId = SecurityFilter.getPartyId(request);
		Key<Party> ancestor = Key.create(Party.class, partyId);
		added.parent = ancestor;
		ofy().save().entity(added).now();
		return added;
	}
	
	@PUT @Path("{id}")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Present editPresent(@Context HttpServletRequest request, @PathParam("id") long id, Present edited) {
		if (edited.id != id) {
			throw new IllegalArgumentException("ids don't match. Received " + id + " and " + edited.id);
		}
		String partyId = SecurityFilter.getPartyId(request);
		Key<Party> ancestor = Key.create(Party.class, partyId);
		edited.parent = ancestor;
		ofy().save().entity(edited).now();
		return edited;
	}
	
	
}
