import { Telegraf, Markup, Context } from "telegraf";
const bot = new Telegraf(process.env.TELEGRAM_TOKEN || "");

interface Mercenary {
  id: number;
  name: string
}
const mercenaries: Mercenary[] = [];

function replyWithList(ctx: Context) {
  let line: string[] = [];
  mercenaries.forEach(m => {
    line.push(`${m.name};`);
  })
  if (line.length > 0) {
    const str = line.join(' ');
    return ctx.reply("🟢 Готовы к игре: " + str);
  }
  return ctx.reply('🔴 Нет активных игроков');
}

const keyboard = Markup.keyboard([
  ["Готов", "Закончил", "Активные бойцы"]
]);

bot.start(ctx => ctx.reply("Приветствую, воин", keyboard));

bot.hears("Готов", ctx => {
  console.log(ctx)
  const mercenary = {
    id: ctx.from.id,
    name: `${ctx.from.first_name} ${ctx.from.last_name}`
  }

  const isAlreadyActive = mercenaries.findIndex(m => m.id === mercenary.id);
  if (isAlreadyActive === -1) {
    mercenaries.push(mercenary);
  }

  replyWithList(ctx);
});

bot.hears("Закончил", ctx => {
  const mercenary = {
    id: ctx.from.id,
  };

  const index = mercenaries.findIndex(m => m.id === mercenary.id);
  if (index !== -1) {
    mercenaries.splice(index, 1);
  }
  ctx.reply('До встречи, боец.');
});

bot.hears("Активные бойцы", ctx => {
  replyWithList(ctx);
})

if (process.env.NODE_ENV === "production") {
  bot.launch({
    webhook: {
      domain: process.env.DOMAIN || "example.com",
      port: process.env.PORT || 3000,
    },
  });
} else {
  bot.launch();
}
