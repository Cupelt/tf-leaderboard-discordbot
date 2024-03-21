const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { fetch } = require('undici');  
const path = require('node:path');

function createEmbed(data) {
    const rank_color = [0xEA6500, 0xD9D9D9, 0xEBB259, 0xC9E3E7, 0x54EBE8]

    return new EmbedBuilder()
        .setColor(rank_color[Math.floor((data.leagueNumber - 1) / 4)])
        .setTitle(`#${data.rank} - 『${data.steamName}』`)
        .setAuthor({ name: `TheFinals-CNS`, iconURL: `https://cdn.discordapp.com/avatars/1219832567570890833/889af2fc8b96fc95cf833a4395092813.webp?size=1024` })
        .setThumbnail(`https://storage.googleapis.com/embark-discovery-leaderboard/img/thumbs/${data.league.toLowerCase().replaceAll(" ", "-")}-thumb.png`)
        .addFields(
            { name: '\u200B', value: '\u200B' },
            { name: ' ═══•°• 랭크 •°•═══', value: `\`\`\`${data.league}\`\`\``, inline: true },
            { name: ' ══•°• 24시간 •°•══', value: `\`\`\`diff\n${(data.change > 0) ? ("+"+data.change) : data.change}\n\`\`\``, inline: true },
        )
        .setFooter({ text: `${data.name}`, iconURL: 'https://cdn2.steamgriddb.com/logo/3dcf08bb1312cd37914637289ba97421.png' });
}

function createPageButton(data, now_page, page_length) {
    const page_count = new ButtonBuilder()
        .setCustomId('page_count')
        .setLabel(`${now_page+1} / ${page_length}`)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true);
    
    const prev_user_1 = new ButtonBuilder()
        .setCustomId('prev_user_1')
        .setStyle(ButtonStyle.Primary)
        .setEmoji("◀")
        .setDisabled(now_page - 1 < 0);

    const next_user_1 = new ButtonBuilder()
        .setCustomId('next_user_1')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('▶')
        .setDisabled(now_page + 1 >= page_length);

    const prev_user_10 = new ButtonBuilder()
        .setCustomId('prev_user_10')
        .setStyle(ButtonStyle.Primary)
        .setEmoji("⏪")
        .setDisabled(now_page - 100 < 0);

    const next_user_10 = new ButtonBuilder()
        .setCustomId('next_user_10')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('⏩')
        .setDisabled(now_page + 10 >= page_length);

    return new ActionRowBuilder()
        .addComponents(prev_user_10, prev_user_1, page_count, next_user_1, next_user_10);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('전적검색')
        .setDescription('TheFinals의 랭크를 검색합니다 (최소순위 10000위)')
        .addStringOption(option => 
            option.setName("검색어")
                .setDescription("유저를 검색합니다. ( * <= 전체검색 )")
                .setRequired(true)),
    async execute(interaction) {
        interaction.deferReply();
        
        let name_tag = interaction.options.getString('검색어');
        if (name_tag === '*'){
            name_tag = '';
        }

        fetch(`https://api.the-finals-leaderboard.com/v1/leaderboard/s2/crossplay?name=${name_tag}`)
            .then((res) => {
                res.json().then(async (result) => {
                    const page_length = result.count;

                    if (page_length === 0) {
                        interaction.editReply("검색 결과가 없습니다 (ㅠ ㅠ)");
                        return;
                    }

                    let now_page = 0;
                    let data = result.data[now_page]

                    const response = await interaction.editReply({
                        embeds: [createEmbed(data)],
                        components: [createPageButton(data, now_page, page_length)],
                    });
                    
                    const collectorFilter = i => i.user.id === interaction.user.id;

                    while (true) {
                        try {
                            const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 20_000 });
                            
                            let addtion = 0;
                            if (confirmation.customId.includes('next_user')) {
                                addtion = 1;
                            } else if (confirmation.customId.includes('prev_user')) {
                                addtion = -1;
                            }

                            multiple = Number(confirmation.customId.replaceAll("next", "").replaceAll("prev", "").replaceAll("_user_", ""));
                            now_page += addtion * multiple;
    
                            data = result.data[now_page]
                            await confirmation.update({
                                embeds: [createEmbed(data)],
                                components: [createPageButton(data, now_page, page_length)],
                            });

                            continue;
                            
                        } catch (e) {
                            await interaction.editReply({
                                embeds: [createEmbed(data)],
                                components: []
                            });

                            break;
                        }
                    }
                    
                });
            });
    }
}