package oadam.security;

import java.io.IOException;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import oadam.Party;
import oadam.resources.unauthenticated.PartyResource;

import com.sun.jersey.core.util.Base64;

public class SecurityFilter implements Filter {

	private static final String REALM = "dedguenodgo";
	public static final String PARTY_ID_SESSION_ATTR = "party-id";

	private PartyResource partyResource = new PartyResource();
	
	@Override
	public void init(FilterConfig filterConfig) throws ServletException {
		// TODO Auto-generated method stub

	}

	private static class UsernamePassword {
		final String username;
		final String password;
		public UsernamePassword(String username, String password) {
			super();
			this.username = username;
			this.password = password;
		}
	}
	
	@Override
	public void doFilter(ServletRequest req, ServletResponse res,
			FilterChain chain) throws IOException, ServletException {
		HttpServletRequest request = (HttpServletRequest) req;
		HttpServletResponse response = (HttpServletResponse) res;
		
		UsernamePassword usernamePassword = getUserNamePassword(request);
		if (usernamePassword == null)  {
			sendError(response);
			return;
		}
		
		Party party = partyResource.getParty(usernamePassword.username);
		if (party == null || !party.checkPassword(usernamePassword.password)) {
			sendError(response);
			return;
		}
		chain.doFilter(request, response);
	}

	public static String getPartyId(HttpServletRequest request) {
		UsernamePassword userNamePassword = getUserNamePassword(request);
		return userNamePassword.username;
	}
	
	private static UsernamePassword getUserNamePassword(HttpServletRequest request) {
		String auth = request.getHeader("Authorization");
		if (auth == null) {
			return null;
		}
		int indexOfSpace = auth.indexOf(' ');
		if (indexOfSpace < 0) {
			return null;
		}
		String afterSpace = auth.substring(indexOfSpace);
		String[] credentials;
		String joinedCredentials = Base64.base64Decode(afterSpace);
		credentials = joinedCredentials.split(":");
		if (credentials.length != 2) {
			return null;
		}
		return new UsernamePassword(credentials[0], credentials[1]);
	}

	private void sendError(HttpServletResponse response) throws IOException {
		response.setHeader("WWW-Authenticate", "Basic realm =\"" + REALM + "\"");
		response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
	}

	@Override
	public void destroy() {
		// TODO Auto-generated method stub

	}

}
