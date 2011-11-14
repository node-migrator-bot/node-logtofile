var
util = require('util'),
fs = require('fs'),
logToFile = require('../lib/log-to-file'),
dataTest = '0',
ONE_K = 1024,
ONE_M = ONE_K * 1024,
ONE_G = ONE_M * 1024,
ONE_T = ONE_G * 1024,
i, tmp = '',
benchParams = {
	0: { 
		fileMaxSize: ONE_M * 5,
		maxBackupFileNumber: 5
	},
	1: { 
		fileMaxSize: ONE_M * 5,
		maxBackupFileNumber: 10
	},
	2: {
		fileMaxSize:  ONE_M * 10,
		maxBackupFileNumber: 10
	}
}, bi = 0;

for ( i = 0; i < 1024; ++i) {
	tmp += dataTest;
}
dataTest = tmp;

function octetToHuman(o) {
	if (o < ONE_K) {
		return String(o) + 'O';
	}
	if (o < ONE_M) {
		return (o / ONE_K).toFixed(2) + 'K';
	}
	if (o < ONE_G) {
		return (o / ONE_M).toFixed(2) + 'MB';
	}
	if (o < ONE_T) {
		return (o / ONE_G).toFixed(2) + 'GB';
	}
	
	return (o / ONE_T).toFixed(2) + 'TB';
}


function runTest() {
	
	var 
	size = 0,
	log,
	elements = 1024 * 1024, 
	start, end, writtingEventCount = 0,
	wcount=0,
	config = benchParams[bi];
	console.log('Running bench %d. fileMaxSize: %s, maxBackupFileNumber: %d', bi, octetToHuman(config.fileMaxSize), config.maxBackupFileNumber);
	bi++;
	
	if (!benchParams.hasOwnProperty(bi)) {
		//clean up
		dirs  = fs.readdirSync(__dirname);
		RE = /benchtest.txt.*/i;
		for (i = 0; i < dirs.length; i++)
		{
			if (!RE.test(dirs[i])){
				continue;
			}
			//console.log('unlink: %s', dirs[i]);
			fs.unlinkSync(__dirname + '/' + dirs[i]);	
		}
		console.log('All done');
		return;
	}
	
	log = logToFile.create({
			directory: __dirname,
			fileName: 'benchtest.txt'
	});
	log.on('writting', function(fileName){
			if (writtingEventCount === 0) {
				start = Date.now();
			}
			writtingEventCount ++; 
	});
	
	log.on('write', function(fileName){
			if (wcount % 1024 === 0) {
				util.print(".");
			}
			wcount++;
	});
	
	log.on('written', function(fileName){
			var duration;
			end = Date.now();
			duration = end - start;
			console.log('Total:%s in %dms: %s/s', 
				octetToHuman(size), 
				duration, 
				octetToHuman(size * 1000 / duration));
			runTest();
			
	});
	
	for (i = 0; i < elements; i++) {
		log.write(dataTest); 
		size += dataTest.length;
	}
}

runTest();
