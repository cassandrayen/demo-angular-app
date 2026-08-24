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
        
        stage('Install Dependencies') {
            steps {
                echo 'Installing npm packages...'
                // Using legacy-peer-deps to match your previous setup
                sh 'npm install --legacy-peer-deps'
            }
        }

        // NEW: ESLint runs right after install to fail-fast on bad code
        stage('ESLint & Code Quality') {
            steps {
                echo 'Running linting...'
                sh 'npm run lint'
            }
        }
        
        stage('Build Angular App') {
            steps {
                echo 'Building the application...'
                sh 'npm run build'
            }
        }
        
        // NEW: AI Code Review runs only on Pull Requests
        stage('Run AI PR Review') {
            when {
                expression { env.CHANGE_URL != null }
            }
            steps {
                echo "Running PR Agent on ${env.CHANGE_URL}"
                sh '''
                    # 1. Export standard Mac paths so Jenkins can find your new Python 3.12 installation
                    export PATH=$PATH:/usr/local/bin:/opt/homebrew/bin
                    
                    # 2. Explicitly call python3.12 to create the virtual environment
                    python3.12 -m venv pr-agent-env
                    source pr-agent-env/bin/activate
                    
                    # 3. Upgrade pip inside the new 3.12 environment
                    python3.12 -m pip install --upgrade pip
                    
                    # 4. Install directly from the official GitHub repository
                    pip install "pr-agent @ git+https://github.com/The-PR-Agent/pr-agent.git@v0.42.0"
                    
                    # 5. Export your required environment variables
                    export GITHUB_TOKEN=$GITHUB_TOKEN
                    export GOOGLE_AI_STUDIO.GEMINI_API_KEY=$GEMINI_API_KEY
                    export CONFIG.MODEL="gemini/gemini-3.6-flash"
                    
                    # 6. Run the AI reviewer directly
                    pr-agent --pr_url $CHANGE_URL review
                '''
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