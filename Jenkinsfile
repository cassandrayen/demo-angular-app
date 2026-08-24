pipeline {
    agent any
    
    tools {
        nodejs 'Node18' 
    }

    environment {
        // Securely load your credentials
        GITHUB_TOKEN = credentials('github-token')
        GEMINI_API_KEY = credentials('gemini-api-key')
        CONFIG_MODEL = "gemini/gemini-3.6-flash"
        PR_URL = "https://github.com/${env.GIT_URL_USER}/${env.GIT_URL_REPO}/pull/${env.CHANGE_ID}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        // AI Review runs FIRST so it always posts feedback to GitHub
        stage('Run AI PR Review') {
            when {
                expression { env.CHANGE_URL != null }
            }
            steps {
                echo "Running PR Agent on ${env.CHANGE_URL}"
                sh '''
                    # 1. Export standard Mac paths so Jenkins can find Python 3.12
                    export PATH=$PATH:/usr/local/bin:/opt/homebrew/bin
                    
                    # 2. Explicitly call python3.12 to create the virtual environment
                    python3.12 -m venv pr-agent-env
                    source pr-agent-env/bin/activate
                    
                    # 3. Upgrade pip inside the 3.12 environment
                    python3.12 -m pip install --upgrade pip
                    
                    # 4. Install directly from the official GitHub repository
                    pip install "pr-agent @ git+https://github.com/The-PR-Agent/pr-agent.git@v0.42.0"
                    
                    # 5. Export environment variables using DOUBLE UNDERSCORES
                    export GITHUB__USER_TOKEN=$GITHUB_TOKEN
                    export GOOGLE_AI_STUDIO__GEMINI_API_KEY=$GEMINI_API_KEY
                    export CONFIG__MODEL="gemini/gemini-3.6-flash"
                    
                    # 6. Disable automatic labels to prevent Gemini JSON parsing errors
                    export PR_REVIEWER__ENABLE_REVIEW_LABELS_SECURITY=false
                    export PR_REVIEWER__ENABLE_REVIEW_LABELS_EFFORT=false
                    
                    # 7. Run both the reviewer and description tools
                    pr-agent --pr_url $CHANGE_URL review
                    pr-agent --pr_url $CHANGE_URL describe
                '''
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installing npm packages...'
                sh 'npm install --legacy-peer-deps'
            }
        }

        // ESLint runs after dependencies are installed
        stage('ESLint & Code Quality') {
            steps {
                echo 'Running linting...'
                // Run ESLint and save output to a text file
                sh 'npx eslint . -f compact > eslint-report.txt || true' 
                
                // Read the report file
                script {
                    def lintOutput = readFile('eslint-report.txt').trim()
                    if (lintOutput) {
                        // Fail the stage intentionally if errors exist
                        error "ESLint violations found:\n${lintOutput}"
                    }
                }
            }
            post {
                failure {
                    // Send the ESLint log directly to the PR comment thread via GitHub API
                    sh '''
                        ESLINT_ERR=$(cat eslint-report.txt)
                        PAYLOAD=$(jq -n --arg body "### ❌ ESLint Violations Found\n\`\`\`text\n$ESLINT_ERR\n\`\`\`" '{body: $body}')
                        
                        curl -s -H "Authorization: token $GITHUB_TOKEN" \
                             -X POST \
                             -d "$PAYLOAD" \
                             "https://api.github.com/repos/${GIT_URL_USER}/${GIT_URL_REPO}/issues/${CHANGE_ID}/comments"
                    '''
                }
            }
        }
        
        stage('Build Angular App') {
            steps {
                echo 'Building the application...'
                sh 'npm run build'
            }
        }
        
        stage('Archive Artifacts') {
            steps {
                echo 'Saving the build output...'
                archiveArtifacts artifacts: 'dist/**/*', allowEmptyArchive: true
            }
        }
    }
}