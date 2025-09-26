resource "aws_s3_bucket" "frontend_bucket" {
    bucket = "stackit-frontend-xyz-898998"

    tags = {
        Name = "StackIt Frontend"
        Project = "StackIt"
    }
}