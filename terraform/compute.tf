#server firewall
resource "aws_security_group" "ec2_sg" {
    name = "stackit-ec2-sg"
    vpc_id = aws_vpc.main.id

    #to allow ssh only from my ip
    ingress {
        from_port = 22
        to_port = 22
        protocol = "tcp"
        cidr_blocks = ["117.222.134.164/32"]

    }

    #to allow http traffic from anywhere
    ingress{
        from_port = 8000
        to_port = 8000
        protocol = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
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
  public_key = file("/mnt/c/Users/Lenovo/.ssh/stackit-key.pub")

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


