package oadam;

import org.joda.time.DateTime;

public class Present {
	public Long id;
	public String title;
	public String description;
	public Long to;
	public Long createdBy;
	public DateTime creationDate;
	public Long offeredBy;
	public DateTime offeredDate;
	public Long deletedBy;
	
	public Present(Long id, String title, String description, Long to,
			Long createdBy, DateTime creationDate, Long offeredBy,
			DateTime offeredDate, Long deletedBy) {
		super();
		this.id = id;
		this.title = title;
		this.description = description;
		this.to = to;
		this.createdBy = createdBy;
		this.creationDate = creationDate;
		this.offeredBy = offeredBy;
		this.offeredDate = offeredDate;
		this.deletedBy = deletedBy;
	}
	
	public Present() {
	}
}
