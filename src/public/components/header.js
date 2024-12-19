Vue.component('app-header', {
    props: {
        currentPage: {
            type: String,
            required: true
        }
    },
    data: () => ({
        theme: localStorage.getItem('theme') || 'light'
    }),
    template: `
        <v-app-bar app color="primary" dark>
            <v-toolbar-title>Talker</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn 
                text 
                href="/config.html"
                :class="{ 'v-btn--active': currentPage === 'windows' }"
            >
                Windows TTS
            </v-btn>
            <v-btn 
                text 
                href="/el-config.html"
                :class="{ 'v-btn--active': currentPage === 'elevenlabs' }"
            >
                ElevenLabs
            </v-btn>
            <v-btn 
                text 
                href="/api-docs" 
                target="_blank"
                rel="noopener noreferrer"
            >
                API Docs
            </v-btn>
            <v-btn icon @click="toggleTheme">
                <v-icon>{{ theme === 'dark' ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
            </v-btn>
        </v-app-bar>
    `,
    methods: {
        toggleTheme() {
            this.theme = this.theme === 'light' ? 'dark' : 'light';
            localStorage.setItem('theme', this.theme);
            this.$vuetify.theme.dark = this.theme === 'dark';
        }
    }
});
