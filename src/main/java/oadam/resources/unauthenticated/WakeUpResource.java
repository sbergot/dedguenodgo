package oadam.resources.unauthenticated;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

@Path("wake-up")
public class WakeUpResource {

	@GET
	@Produces(MediaType.TEXT_PLAIN)
	public String wakeUp() {
		return "OK";
	}
}
