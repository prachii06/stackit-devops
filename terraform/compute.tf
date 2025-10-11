#find official list of cloudfront ips
data "aws_ec2_managed_prefix_list" "cloudfront" {
  name = "com.amazonaws.global.cloudfront.origin-facing"
}

#server firewall
resource "aws_security_group" "ec2_sg" {
    name = "stackit-ec2-sg"
    vpc_id = aws_vpc.main.id

    #to allow ssh only from my ip
    ingress {
        from_port = 22
        to_port = 22
        protocol = "tcp"
        cidr_blocks = ["59.184.96.170/32"]   

    }

    #to allow http traffic from anywhere
    ingress{
        from_port = 8000
        to_port = 8000
        protocol = "tcp"
        cidr_blocks = [data.aws_ec2_managed_prefix_list.cloudfront.id]
    }

    #to allow all ooutbound traffic so that server can download required things
    egress{
        from_port = 0
        to_port = 0
        protocol = "-1"
        cidr_blocks = ["0.0.0.0/0"]
    }

    tags = {
        Name = "stackit ec2 firewall"
    }
}

#keypair
resource "aws_key_pair" "stackit_key" {
  key_name   = "stackit-key"
  public_key = file("~/.ssh/stackit-key.pub")

}

#ec2instance
resource "aws_instance" "stackit_server"{
    ami = "ami-0f918f7e67a3323f0"
    instance_type = "t3.micro"
    key_name = aws_key_pair.stackit_key.key_name

    subnet_id              = aws_subnet.public.id
    vpc_security_group_ids = [aws_security_group.ec2_sg.id]

    tags = {
        Name = "stackit server"
    }
}

#elastic ip
resource "aws_eip" "stackit_ip"{
    instance  = aws_instance.stackit_server.id
    domain    = "vpc"
}

#tells database firewall to allow traffic from our ec2 instance
resource "aws_security_group_rule" "db_allow_rule" {
    type                     = "ingress"
    from_port                = 5432
    to_port                  = 5432
    protocol                 = "tcp"
    source_security_group_id = aws_security_group.ec2_sg.id
    security_group_id        = aws_security_group.rds_sg.id
}




#use ssh -i ~/.ssh/stackit-key ubuntu@<elastic-ip> to connect to server as we are using ubuntu ami
#if using amazon linux ami use ec2-user instead of ubuntu in above commmand