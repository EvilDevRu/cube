Cube.models.redis('rubrics').find(1).one(function(err, rubric) {
	if (err) {
		console.log('f*ck');
		return;
	}

	console.log(rubric.getAll());
});

Cube.models.redis('rubrics').with('articles').find(3, 1).all(function(err, rubric) {
	if (err) {
		console.log('f*ck');
		return;
	}

	console.log(rubric);
});

Cube.models.redis('articles').find('all', { limit: [0, -1] }).list(function(err, articles) {
	if (err) {
		console.log('f*ck', err);
		return;
	}

	console.log(articles);
});

Cube.models.redis('rubrics').find(1, 2).all(function(err, rubrics) {
	if (err) {
		console.log('f*ck');
		return;
	}

	console.log(rubrics);
});

Cube.models.redis('rubrics').find([1, 2]).all(function(err, rubrics) {
	if (err) {
		console.log('f*ck');
		return;
	}

	console.log(rubrics);
});

/**
 * USERS EXAMPLE!
 */
Cube.models.redis('users').find(1).one(function(err, rubric) {
	if (err) {
		console.log('f*ck', err);
		return;
	}

	console.log(rubric.getAll());
});

Cube.models.redis('users').find({ login: 'evildev' }).one(function(err, rubric) {
	if (err) {
		console.log('f*ck', err);
		return;
	}

	console.log(rubric.getAll());
});





Cube.models.redis('rubrics').with('articles').find(3).one(function(err, rubric) {
	//
});

Cube.models.redis('rubrics').find().all(function(err, rubric) {
	//
});

Cube.models.redis('rubrics').find({ login: 'evildev' }).one(function(err, rubric) {
	//
});

Cube.models.redis('rubrics').find('list').key(function(err, rubric) {
	//
});


Cube.models.redis('articles').with('rubrics').find('all', { limit: 10, scores: true }).list(function(err, articles) {
	if (err) {
		console.log('f*ck', err);
		return;
	}

	coms.render(this, 'index', {
		location: coms.request.getLocation(),
		articles: articles
	});
}.bind(this));