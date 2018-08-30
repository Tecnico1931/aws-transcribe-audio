const fs = require('fs');

cleanTranscript('./tests/2018...08...copy_405_TMNR_Episode.mp3.376764984.json', 'r')
    .then(transcript => console.log(transcript))
    .catch(error => console.log(error));

async function cleanTranscript(filename) {
    try {
        const jsonbuffer = fs.readFileSync(filename , {encoding: 'utf8', flag: 'r'});
        const json = JSON.parse(jsonbuffer);
        
        const transcript = parseTranscriptJson(json);
        const printout = stringifyTranscriptObject(transcript);

//        return transcript;
        return printout;
    } catch (error) {
        console.log('error dude');
        throw error;
        return null;
    }
}

/* AWS Transcript JSON format 
 *
 *Object *  accountId:
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

function parseTranscriptJson(json) {
    const speakers = json.results.speaker_labels.segments[Symbol.iterator]();
    const words = json.results.items[Symbol.iterator]();

    let transcript = { phrases: [] };
    let word = words.next();

    function isSpokenBy(speaker, word) {
        const isPunctuation = word.type === 'punctuation';
        const inSpeakerPeriod = parseFloat(word.start_time) < parseFloat(speaker.end_time);
        return isPunctuation || inSpeakerPeriod;
    }

    for (let speaker of speakers) {
        const phrase = { 
            speaker_label: speaker.speaker_label,
            start_time: speaker.start_time,
            end_time: speaker.end_time,
            words: []
        };

        while (!word.done && isSpokenBy(speaker, word.value)) {
            phrase.words.push({
                content: word.value.alternatives[0].content,
                type: word.value.type
            });

            word = words.next();
        }

        //Don't keep phrases with no words.
        if (phrase.words.length > 0) {
            last_phrase = transcript.phrases.pop();

            //Add word list to previous phrase if the speakers are the same.
            if (last_phrase) {
                if (last_phrase.speaker_label === phrase.speaker_label) {
                    phrase.words = [...last_phrase.words, ...phrase.words];
                } else {
                    transcript.phrases.push(last_phrase);
                }
            }

            transcript.phrases.push(phrase);
        }
    }

    return transcript;
}

/* Transcript Object Format
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

//opportunity to double reduce.
function stringifyTranscriptObject(transcript) {
    let text = ` `;

    for (phrase of transcript.phrases) {
        const timestamp = prettifyTime(parseFloat(phrase.start_time));
        const start_of_phrase = `[${timestamp}] ${phrase.speaker_label}:\n`

        const segment = phrase.words.reduce((spiel, word) => {
            const prefix = (word.type === 'punctuation') ? '' : ' ';
            return spiel + prefix + word.content;
        }, start_of_phrase);

        text += `${segment}\n\n`;
    }

    return text;
}

function prettifyTime(total_seconds) {
    function padTime(time) {
        return (time < 10) ? `0${time}` : `${time}`;
    }

    const hours = padTime(Math.floor(total_seconds / 3600));
    const minutes = padTime(Math.floor((total_seconds % 3600) / 60));
    const seconds = padTime((total_seconds % 60).toFixed(2));

    return `${hours}:${minutes}:${seconds}`;
}

