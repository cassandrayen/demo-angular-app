pipeline {
    agent any
    
    // This tells Jenkins to use Node.js (requires the NodeJS plugin in Jenkins)
    tools {
        nodejs 'Node16' // This name must match the tool configuration in your Jenkins server
    }

    stages {
        stage('Checkout') {
            steps {
                // Pulls the latest code from GitHub
                checkout scm
            }
        }
        
        stage('Install Dependencies') {
            steps {
                echo 'Installing npm packages...'
                sh 'npm install'
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
                // This saves the compiled Angular app (usually in the dist folder)
                archiveArtifacts artifacts: 'dist/**/*', allowEmptyArchive: true
            }
        }
    }
}