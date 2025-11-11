all: zip firefox

zip:
	zip schedule-share.zip -r schedule-share/

firefox: 
	(cd schedule-share && zip ../schedule-share.xpi -r ./)
