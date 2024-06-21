document.addEventListener('DOMContentLoaded', async function() {
    const SUPABASE_URL = 'https://xgycsakujaopnbkgeuvg.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhneWNzYWt1amFvcG5ia2dldXZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTg4MTg4ODcsImV4cCI6MjAzNDM5NDg4N30.TkdIIO1_nD1XiH133jev1B4It2bcIRjIZRhgudQPBTw';
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    let participants = [];
    const ranking = {};
    let semifinalWinners = [];

    async function loadTournamentData() {
        const urlParams = new URLSearchParams(window.location.search);
        const tournamentId = urlParams.get('id');

        try {
            const { data, error } = await supabaseClient
                .from('tournaments')
                .select('*')
                .eq('id', tournamentId)
                .single();

            if (error) throw error;

            document.getElementById('tournamentName').textContent = data.tournament_name;
            document.getElementById('adminName').textContent = data.admin_name;

            participants = JSON.parse(data.participants);
            participants.forEach(participant => ranking[participant] = 0);
            renderRanking();
            generateMatches(participants);
        } catch (error) {
            console.error("Erro ao carregar dados do torneio:", error);
        }
    }

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function generateMatches(participants) {
        const matchesContainer = document.getElementById('matchesContainer');
        matchesContainer.innerHTML = '';

        const matches = [];
        for (let i = 0; i < participants.length; i++) {
            for (let j = i + 1; j < participants.length; j++) {
                matches.push({ participant1: participants[i], participant2: participants[j] });
            }
        }

        const shuffledMatches = shuffle(matches);

        shuffledMatches.forEach((match, index) => {
            const matchDiv = document.createElement('div');
            matchDiv.classList.add('match');
            matchDiv.textContent = `${match.participant1} vs ${match.participant2}`;
            matchDiv.id = `match-${index}`;

            const resultInput1 = document.createElement('input');
            resultInput1.type = 'number';
            resultInput1.max = 4;
            resultInput1.min = 0;
            resultInput1.placeholder = `${match.participant1} Pinos`;
            resultInput1.id = `result-${index}-1`;

            const resultInput2 = document.createElement('input');
            resultInput2.type = 'number';
            resultInput2.max = 4;
            resultInput2.min = 0;
            resultInput2.placeholder = `${match.participant2} Pinos`;
            resultInput2.id = `result-${index}-2`;

            const submitResultButton = document.createElement('button');
            submitResultButton.textContent = 'Registrar Resultado';
            submitResultButton.addEventListener('click', () => registerResult(index, match.participant1, match.participant2));

            matchDiv.appendChild(resultInput1);
            matchDiv.appendChild(resultInput2);
            matchDiv.appendChild(submitResultButton);
            matchesContainer.appendChild(matchDiv);
        });
    }

    function registerResult(matchIndex, participant1, participant2) {
        const resultInput1 = document.getElementById(`result-${matchIndex}-1`);
        const resultInput2 = document.getElementById(`result-${matchIndex}-2`);
        const pinos1 = parseInt(resultInput1.value);
        const pinos2 = parseInt(resultInput2.value);

        if (
            isNaN(pinos1) || pinos1 < 0 || pinos1 > 4 ||
            isNaN(pinos2) || pinos2 < 0 || pinos2 > 4
        ) {
            alert('Número de pinos inválido. Verifique as regras.');
            return;
        }

        if (pinos1 === 4 && pinos2 >= 4) {
            alert('Somente um participante pode marcar 4 pinos.');
            return;
        }

        resultInput1.disabled = true;
        resultInput2.disabled = true;
        resultInput1.nextElementSibling.disabled = true;

        updateRanking(participant1, pinos1);
        updateRanking(participant2, pinos2);

        checkAllMatchesCompleted();
    }

    function updateRanking(participant, points) {
        ranking[participant] += points;
        renderRanking();
    }

    function renderRanking() {
        const rankingBody = document.getElementById('rankingBody');
        rankingBody.innerHTML = '';

        const sortedRanking = Object.keys(ranking).sort((a, b) => ranking[b] - ranking[a]);

        sortedRanking.forEach((participant, index) => {
            const row = document.createElement('tr');
            if (index < 4) {
                row.classList.add('highlight');
            }

            const positionCell = document.createElement('td');
            positionCell.textContent = index + 1;

            const participantCell = document.createElement('td');
            participantCell.textContent = participant;

            const pointsCell = document.createElement('td');
            pointsCell.textContent = ranking[participant];

            row.appendChild(positionCell);
            row.appendChild(participantCell);
            row.appendChild(pointsCell);
            rankingBody.appendChild(row);
        });
    }

    function checkAllMatchesCompleted() {
        const allResultsRegistered = Array.from(document.querySelectorAll('.match input[type="number"]')).every(input => input.disabled);

        if (allResultsRegistered) {
            showNextRounds();
        }
    }

    function showNextRounds() {
        document.getElementById('semifinalsContainer').style.display = 'block';

        const sortedRanking = Object.keys(ranking).sort((a, b) => ranking[b] - ranking[a]);
        const top4 = sortedRanking.slice(0, 4);

        const semifinalMatches = [
            { participant1: top4[0], participant2: top4[3] },
            { participant1: top4[1], participant2: top4[2] }
        ];

        const semifinalsContainer = document.getElementById('semifinalsContainer');
        semifinalsContainer.innerHTML = '<h3>Semifinais</h3>';

        semifinalMatches.forEach((match, index) => {
            const matchDiv = document.createElement('div');
            matchDiv.classList.add('semifinal');
            matchDiv.textContent = `${match.participant1} vs ${match.participant2}`;
            matchDiv.id = `semifinal-${index}`;

            const resultInput1 = document.createElement('input');
            resultInput1.type = 'number';
            resultInput1.max = 4;
            resultInput1.min = 0;
            resultInput1.placeholder = `${match.participant1} Pinos`;
            resultInput1.id = `semifinal-result-${index}-1`;

            const resultInput2 = document.createElement('input');
            resultInput2.type = 'number';
            resultInput2.max = 4;
            resultInput2.min = 0;
            resultInput2.placeholder = `${match.participant2} Pinos`;
            resultInput2.id = `semifinal-result-${index}-2`;

            const submitResultButton = document.createElement('button');
            submitResultButton.textContent = 'Registrar Resultado';
            submitResultButton.addEventListener('click', () => registerSemifinalResult(index, match.participant1, match.participant2));

            matchDiv.appendChild(resultInput1);
            matchDiv.appendChild(resultInput2);
            matchDiv.appendChild(submitResultButton);
            semifinalsContainer.appendChild(matchDiv);
        });
    }

    function registerSemifinalResult(matchIndex, participant1, participant2) {
        const resultInput1 = document.getElementById(`semifinal-result-${matchIndex}-1`);
        const resultInput2 = document.getElementById(`semifinal-result-${matchIndex}-2`);
        const pinos1 = parseInt(resultInput1.value);
        const pinos2 = parseInt(resultInput2.value);

        if (
            isNaN(pinos1) || pinos1 < 0 || pinos1 > 4 ||
            isNaN(pinos2) || pinos2 < 0 || pinos2 > 4
        ) {
            alert('Número de pinos inválido. Verifique as regras.');
            return;
        }

        if (pinos1 === 4 && pinos2 >= 4) {
            alert('Somente um participante pode marcar 4 pinos.');
            return;
        }

        resultInput1.disabled = true;
        resultInput2.disabled = true;
        resultInput1.nextElementSibling.disabled = true;

        const winner = pinos1 > pinos2 ? participant1 : participant2;
        semifinalWinners.push(winner);

        if (semifinalWinners.length === 2) {
            showFinal();
        }
    }

    function showFinal() {
        const finalsContainer = document.getElementById('finalsContainer');
        finalsContainer.style.display = 'block';
        finalsContainer.innerHTML = `<h3>Final</h3><p>${semifinalWinners[0]} vs ${semifinalWinners[1]}</p>`;
    }

    loadTournamentData();
});
