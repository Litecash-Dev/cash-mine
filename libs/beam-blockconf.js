require('colors');
// const axios = require('axios');
const request = require('request-promise');
const mysql = require('mysql2/promise');
const {spawn} = require('child_process');

//const coinid = 2423;
const coin_symbol = 'CASH';
const confirmations = 10;
const api = 'http://127.0.0.1:666';

function payWorkers(){
   return spawn('python3', [
      "-u",
      '/home/<user>/cash-mine/cash-pay/auto_payment.py', // change to local installation path
   ]);
}


module.exports = async function() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: '',
    password: '',
    database: '',
  });
  const [blocks, fields] = await connection.execute(`SELECT * FROM blocks`);
  const data = JSON.parse(await request.get(`${api}/status`));
  //console.log(data);
  for (const block of blocks) {
    try {
      const apiBlock = JSON.parse(await request.get(`${api}/block?height=${block.height}`));
      //console.log("height " + block.height + " hash :" + apiBlock.hash);
      if (typeof apiBlock === 'undefined' || (!apiBlock || !apiBlock.hash)) {
	console.log(`hash not found in API, skipping`.red);
	continue;
      }
      if (block.blockhash == apiBlock.hash) {
        if(block.blockdiff != block.difficulty)
        {
          console.log(`Block ${block.height} ORPHAN`.red, block.blockhash, apiBlock.hash);
          await connection.execute('UPDATE blocks SET category = ? WHERE id = ?', ['orphan', block.id]); 
          console.log(`Difficulty mismatch`.red);
        }
        // If they equal update conf count
        const difference = data.height - block.height;
        //console.log('Block Height Confirmed: ', block.height, difference, `${difference >= confirmations}`.yellow);
        // if conf count >= 1440 mark as generated

	if (difference >= confirmations) {
          if(block.category == 'pending')
          {
           await connection.execute('UPDATE blocks SET confirmations = ?, category = ? WHERE id = ?', [
             difference,
             'generate',
             block.id,
           ]);
           //Trigger payment of workers on block confirmation
           //payWorkers();
          }
          else
          {
           await connection.execute('UPDATE blocks SET confirmations = ? WHERE id = ?', [difference, block.id]);
          }
        } else {
	  console.log(`updating blocks confirms `.green, difference," for block ",block.id);
          await connection.execute('UPDATE blocks SET confirmations = ? WHERE id = ?', [difference, block.id]);
        }

      } else {
        console.log(`BLOCK FOUND `.green,apiBlock.height);
        await connection.execute('UPDATE blocks SET category = ?, blockhash = ?, difficulty = ?, reward = ? WHERE id = ?', ['pending', apiBlock.hash, apiBlock.difficulty, (apiBlock.subsidy/100000000), block.id]);
      }
    } catch (e) {
      console.log('Error fetching block from API: '.red, e.message);
    }
  }
  //console.log('Done'.green);
  connection.close();
};

//start()
// 
//setInterval(() => {
//    start()
// }, 1000 * 30)
