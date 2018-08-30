const fs = require('fs');

cleanTranscript('./tests/2018...08...copy_405_TMNR_Episode.mp3.376764984.json', 'r')
    .then(transcript => console.log(JSON.stringify(transcript, null, '\t')))
    .catch(error => console.log(error));

/* Transcript JSON format 
 *
 *Object
 *  accountId:
 *  jobName:
 *  status:
 *  results:
 *      transcripts: []
 *          transcript:
 *      speaker_labels:
 *          speakers:
 *          segments: []
 *              start_time:
 *              speaker_label:
 *              end_time:
 *              items: []
 *                  start_time:
 *                  speaker_label:
 *                  end_time:
 *      items: []
 *          alternatives:
 *              confidence:
 *              content:
 *          end_time:
 *          start_time:
 *          type:
 * */

async function cleanTranscript(filename) {
    try {
        const jsonbuffer = fs.readFileSync(filename , {encoding: 'utf8', flag: 'r'});
        const json = JSON.parse(jsonbuffer);
        
        const transcript = parseTranscriptJson(json);
        const printout = stringifyTranscriptObject(transcript);

        return transcript;
        return printout;
    } catch (error) {
        console.log('error dude');
        throw error;
        return null;
    }
}


/* Produce a Transcript Object 
 *
 *Object:
 *  phrases: []
 *      speaker_label:
 *      start_time:
 *      end_time:
 *      words: []
 *          content:
 *          type:
 */

function parseTranscriptJson(json) {
    const speakers = json.results.speaker_labels.segments[Symbol.iterator]();
    const words = json.results.items[Symbol.iterator]();

    let transcript = { phrases: [] };
    let word = words.next();

    function isSpokenBy(speaker, wordIterator) {
        const isDone = wordIterator.done;
        if (isDone) {
            return false;
        }

        const word = wordIterator.value;
        const isPunctuation = word.type === 'punctuation';
        const inSpeakerPeriod = parseFloat(word.start_time) < parseFloat(speaker.end_time);
        return isPunctuation || inSpeakerPeriod;
    }

    for (let speaker of speakers) {
        let phrase = { 
            speaker_label: speaker.speaker_label,
            start_time: speaker.start_time,
            end_time: speaker.end_time,
            words: []
        };

        while (isSpokenBy(speaker, word)) {
            phrase.words.push({
                content: word.value.alternatives[0].content,
                type: word.value.type
            });

            word = words.next();
        }

        transcript.phrases.push(phrase);
    }

    return transcript;
}

function stringifyTranscriptObject(transcript) {
    //if words property is empty don't print speaker.
}
