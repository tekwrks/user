project=tekwrks
name=user

.PHONY:build
build:
	docker image build \
		-t ${project}/${name}:latest \
		.

.PHONY:run
run:
	docker container run \
		--rm \
		--name ${project}-${name}-dev \
		--env-file .env \
		-p 7000:7000 \
		-t ${project}/${name}:latest

.PHONY:kill
kill:
	docker kill $$( \
		docker ps -aq \
			--filter="name=${project}-${name}-dev" )

