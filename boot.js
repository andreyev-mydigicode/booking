
var cluster = require('cluster')
var workerCount = require('os').cpus().length
cluster.setupMaster({ exec: 'server.js' })

function numWorkers() {
	return Object.keys(cluster.workers).length
}

var stopping = false

function forkNewWorkers() {
	if (!stopping) {
		for (var i = numWorkers(); i < workerCount; i++) {
			cluster.fork()
		}
	}
}

var workersToStop = []

function stopWorker(worker) {
	console.log('stopping', worker.process.pid)
	worker.disconnect()
	var killTimer = setTimeout(function() {
		worker.kill()
	}, 5000)

	killTimer.unref()
}

function stopNextWorker() {
	var i = workersToStop.pop()
	var worker = cluster.workers[i]
	if (worker) stopWorker(worker)
}

function stopAllWorkers() {
	stopping = true
	console.log('stopping all workers')
	for (var id in cluster.workers) {
		stopWorker(cluster.workers[id])
	}
}

cluster.on('listening', stopNextWorker)
cluster.on('disconnect', forkNewWorkers)
process.on('SIGHUP', function() {
	console.log('restarting all workers')
	workersToStop = Object.keys(cluster.workers)
	stopNextWorker()
})

process.on('SIGTERM', stopAllWorkers)

forkNewWorkers()
console.log('boot master', process.pid, 'booted')
