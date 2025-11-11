zip:
	zip -j schedule-share.zip -r schedule-share/

firefox: zip
	mv schedule-share.zip schedule-share.xpi
