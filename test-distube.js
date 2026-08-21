import ytpl from '@distube/ytpl';
async function run() {
    try {
      const playlist = await ytpl('PLchMzReuuu_8PieB87bPG3rTxWogLuoMB');
      console.log(playlist.items.length);
      console.log(playlist.items[0].title);
    } catch (err) { console.error(err); }
}
run();
