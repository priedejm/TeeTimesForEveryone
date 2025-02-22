import { Client } from 'ssh2';

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { course, day, minTime, maxTime, players, user } = req.body;

    const conn = new Client();
    const sshConfig = {
      host: '10.0.0.105', //174.177.139.183
      port: 6969,
      username: 'teetimesuser',
      password: 'huyterhuyter4!'
    };

    conn.on('ready', () => {
      const command = `python3 /home/teetimesuser/createCronJobTeeTimes/createCronJob.py "${course}" "${day}" "${minTime}" "${maxTime}" "${players}" "1" "${user}"`;
      // const command = 'echo "hello" > /home/teetimesuser/filename.txt'
      conn.exec(command, (err, stream) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Failed to execute SSH command' });
        }

        stream.on('close', (code, signal) => {
          conn.end();
          if (code === 0) {
            return res.status(200).json({ message: 'SSH command executed successfully' });
          } else {
            return res.status(500).json({ error: 'Failed to execute command on Raspberry Pi' });
          }
        });

        stream.on('data', (data) => {
          console.log('STDOUT:', data.toString());
        });

        stream.stderr.on('data', (data) => {
          console.error('STDERR:', data.toString());
        });
      });
    }).connect(sshConfig);
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
