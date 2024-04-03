import { 
    SlashCommandBuilder, 
    CommandInteraction, 
    Collection, 
    PermissionResolvable,
    Message,
    AutocompleteInteraction, 
    ChatInputCommandInteraction 
} from "discord.js"

export interface SlashCommand {
    data: SlashCommandBuilder,
    execute: (interaction : ChatInputCommandInteraction) => void,
    autocomplete?: (interaction: AutocompleteInteraction) => void,
    modal?: (interaction: ModalSubmitInteraction<CacheType>) => void,
}

export interface BotEvent {
    name: Events,
    once?: boolean | false,
    execute: (...args?) => void
}

declare module "discord.js" {
    export interface Client {
        commands: Collection<string, SlashCommand>,
    }
}