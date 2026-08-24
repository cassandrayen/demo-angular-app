pipeline {
    agent any
    
    tools {
        nodejs 'Node18' 
    }

    environment {
        GITHUB_TOKEN = credentials('github-token')
        GEMINI_API_KEY = credentials('gemini-api-key')
        CONFIG_MODEL = "gemini/gemini-3.6-flash"
    }

    stages {
        stage('Checkout & Notify GitHub') {
            steps {
                checkout scm
                // Send pending status directly to GitHub API
                sh '''
                    if [ -n "$CHANGE_ID" ]; then
                        COMMIT_SHA=$(git rev-parse HEAD)
                        PAYLOAD=$(jq -n --arg state "pending" \
                                       --arg target_url "${BUILD_URL}console" \
                                       --arg description "Jenkins build in progress..." \
                                       --arg context "jenkins/pr-merge" \
                                       '{state: $state, target_url: $target_url, description: $description, context: $context}')
                        
                        curl -s -H "Authorization: token $GITHUB_TOKEN" \
                             -H "Content-Type: application/json" \
                             -X POST \
                             -d "$PAYLOAD" \
                             "https://api.github.com/repos/${env.CHANGE_FORK}/${env.CHANGE_TARGET}/statuses/${COMMIT_SHA}" || true
                    fi
                '''
            }
        }
        
        // 1. AI PR Review runs FIRST
        stage('Run AI PR Review') {
            when {
                expression { env.CHANGE_URL != null }
            }
            steps {
                echo "Running PR Agent on ${env.CHANGE_URL}"
                sh '''
                    export PATH=$PATH:/usr/local/bin:/opt/homebrew/bin
                    python3.12 -m venv pr-agent-env
                    source pr-agent-env/bin/activate
                    python3.12 -m pip install --upgrade pip
                    pip install "pr-agent @ git+https://github.com/The-PR-Agent/pr-agent.git@v0.42.0"

                    export GITHUB__USER_TOKEN=$GITHUB_TOKEN
                    export GOOGLE_AI_STUDIO__GEMINI_API_KEY=$GEMINI_API_KEY
                    export CONFIG__MODEL="gemini/gemini-3.6-flash"
                    export PR_REVIEWER__ENABLE_REVIEW_LABELS_SECURITY=false
                    export PR_REVIEWER__ENABLE_REVIEW_LABELS_EFFORT=false

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

        stage('ESLint & Code Quality') {
            steps {
                echo 'Running linting...'
                sh 'npx eslint . -f compact > eslint-report.txt || true'
                script {
                    def lintOutput = readFile('eslint-report.txt').trim()
                    if (lintOutput) {
                        error "ESLint violations found"
                    }
                }
            }
            post {
                failure {
                    sh '''
                        if [ -n "$CHANGE_ID" ] && [ -f eslint-report.txt ]; then
                            ESLINT_ERR=$(cat eslint-report.txt)
                            COMMENT_BODY=$(printf "### ❌ ESLint Violations Found\\n\\`\\`\\`text\\n%s\\n\\`\\`\\`" "$ESLINT_ERR")
                            PAYLOAD=$(jq -n --arg body "$COMMENT_BODY" '{body: $body}')
                            
                            curl -s -H "Authorization: token $GITHUB_TOKEN" \
                                 -H "Content-Type: application/json" \
                                 -X POST \
                                 -d "$PAYLOAD" \
                                 "https://api.github.com/repos/${env.CHANGE_FORK}/${env.CHANGE_TARGET}/issues/${env.CHANGE_ID}/comments" || true
                        fi
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

    post {
        always {
            // Update final status (success/failure) directly on GitHub
            sh '''
                if [ -n "$CHANGE_ID" ]; then
                    COMMIT_SHA=$(git rev-parse HEAD)
                    if [ "$BUILD_STATUS" = "SUCCESS" ] || [ "$currentBuild.currentResult" = "SUCCESS" ]; then
                        STATE="success"
                        DESC="Jenkins build passed successfully!"
                    else
                        STATE="failure"
                        DESC="Jenkins build failed."
                    fi

                    PAYLOAD=$(jq -n --arg state "$STATE" \
                                   --arg target_url "${BUILD_URL}console" \
                                   --arg description "$DESC" \
                                   --arg context "jenkins/pr-merge" \
                                   '{state: $state, target_url: $target_url, description: $description, context: $context}')
                    
                    curl -s -H "Authorization: token $GITHUB_TOKEN" \
                         -H "Content-Type: application/json" \
                         -X POST \
                         -d "$PAYLOAD" \
                         "https://api.github.com/repos/${env.CHANGE_FORK}/${env.CHANGE_TARGET}/statuses/${COMMIT_SHA}" || true
                fi
            '''
        }
    }
}