const { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    ActionRowBuilder, 
    ComponentType, 
    ModalBuilder, 
    TextInputBuilder,
    TextInputStyle 
} = require('discord.js');

const { request } = require('undici');  
const path = require('node:path');
const logger = require("../../logger")

function createEmbed(data) {
    const rank_color = [0xEA6500, 0xD9D9D9, 0xEBB259, 0xC9E3E7, 0x54EBE8]

    return new EmbedBuilder()
        .setColor(rank_color[Math.floor((data.leagueNumber - 1) / 4)])
        .setTitle(`#${data.rank} - 『${data.steamName != "" ? data.steamName : data.xboxName != "" ? data.xboxName : data.psnName}』`)
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
        .setLabel(`${now_page + 1} / ${page_length}`)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page_length === 1);

    const btn_symbols = [
        {symbol: '⏪', page: -10},
        {symbol: '◀', page: -1},
        {symbol: '/', page: 0},
        {symbol: '▶', page: +1},
        {symbol: '⏩', page: +10}
    ];

    let action_rows = new ActionRowBuilder();
        
    for (let i = 0; i < btn_symbols.length; i++) {
        if  (btn_symbols[i].symbol == '/') {
            action_rows.addComponents(page_count)
            continue;
        }

        action_rows.addComponents(
            new ButtonBuilder()
                .setCustomId('page_count_' + btn_symbols[i].page)
                .setStyle(ButtonStyle.Primary)
                .setEmoji(btn_symbols[i].symbol)
                .setDisabled(now_page + btn_symbols[i].page < 0 || now_page + btn_symbols[i].page > (page_length - 1))
        );
    }

    return action_rows;
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
        await interaction.deferReply();
        
        let name_tag = interaction.options.getString('검색어');
        if (name_tag === '*'){
            name_tag = '';
        }

        const result = await request(`https://api.the-finals-leaderboard.com/v1/leaderboard/s2/crossplay?name=${name_tag}`)
        const rank_data= await result.body.json()

        const page_length = rank_data.count;

        if (page_length === 0) {
            interaction.editReply("검색 결과가 없습니다 (ㅠ ㅠ)");
            return;
        }

        let now_page = 0;
        let data = rank_data.data[now_page]

        const response = await interaction.editReply({
            embeds: [createEmbed(data)],
            components: [createPageButton(data, now_page, page_length)],
        });

        const collector = response.createMessageComponentCollector({
            filter: i => i.user.id === interaction.user.id,
            componentType: ComponentType.Button, 
            idle: 20_000
        });

        collector.on('collect', async (collected_interaction) => {
            const component = collected_interaction.component;

            if (component.customId === 'page_count') {
                const modal = new ModalBuilder()
                    .setCustomId(`move_page_${interaction.user.id}`)
                    .setTitle('페이지 이동');
                
                const page_input = new TextInputBuilder()
                    .setCustomId(`inputed_page`)
                    .setMaxLength(5)
                    .setMinLength(1)
                    .setLabel("이동할 페이지를 입력하세요.")
                    .setPlaceholder(`1~${page_length} / 현재 페이지 ${now_page + 1}`)
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);
                
                await collected_interaction.showModal(modal.addComponents(new ActionRowBuilder().addComponents(page_input)));

                const modal_filter = (i) => i.customId === `move_page_${i.user.id}`
                let is_modal_faild = false;
                await collected_interaction
                    .awaitModalSubmit({ modal_filter, time: 20_000 })
                    .then((modal_interaction) => {
                        inputed_page = modal_interaction.fields.getTextInputValue('inputed_page');

                        regex = /^0*[1-9]\d*$/;
                        if (regex.test(inputed_page) && Number(inputed_page) <= page_length) {
                            now_page = Number(inputed_page) - 1;
                            data = rank_data.data[now_page]

                            modal_interaction.update({
                                embeds: [createEmbed(data)],
                                components: [createPageButton(data, now_page, page_length)],
                            });
                        } else {
                            modal_interaction.reply({ content: `1 부터 ${page_length} 까지의 숫자만 입력해 주세요!`, ephemeral: true });
                            is_modal_faild = true;
                        }
                    })
                    .catch((err) => {
                        console.log(err);
                        is_modal_faild = true;
                    });
                
                if (is_modal_faild) return;

            } else {
                now_page += Number(component.customId.replaceAll('page_count_', ""));
                data = rank_data.data[now_page]
            
                await collected_interaction.update({
                    embeds: [createEmbed(data)],
                    components: [createPageButton(data, now_page, page_length)],
                });
            }

        });

        collector.on('end', async () => {
            await interaction.editReply({ components: []})
        })
    }
}