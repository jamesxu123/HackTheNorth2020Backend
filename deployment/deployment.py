from flask import Flask, request
import subprocess

imageid = "200"

app = Flask(__name__)

@app.route('/setup/')
def setupWorkspace():
    workspaceid = request.json["workspaceId"]
    vmid = request.json["vmId"]
    name = request.json["name"]
    ip = request.json["ip"]
    
    res = subprocess.call('/usr/bin/ssh -o "StrictHostKeyChecking=no" %s "/usr/sbin/qm clone %s %s --name %s"'%(metal, imageid, vmid, name), shell=True)
    print(res)

    res = subprocess.call('/usr/bin/ssh -o "StrictHostKeyChecking=no" %s "/usr/sbin/qm set %s -ipconfig0 ip=%s/24,gw=172.16.0.1"'%(metal, vmid, ip), shell=True)
    print(res)

    snippetName = "autodeploy-%s.yml"%workspaceid
    snippetPath = "/var/lib/vz/snippets/" + snippetName

    snippetFile = '''#cloud-config
    hostname: space-%s
    manage_etc_hosts: true
    chpasswd:
      expire: False
    package_upgrade: false'''%workspaceid
        
    res = subprocess.call('/usr/bin/ssh -o "StrictHostKeyChecking=no" %s "echo \\"%s\\" > %s"'%(metal, snippetFile, snippetPath), shell=True)
    print(res)
        
    res = subprocess.call('/usr/bin/ssh -o "StrictHostKeyChecking=no" %s "/usr/sbin/qm set %s --cicustom \\"user=local:snippets/%s\\""'%(metal, vmid, snippetName), shell=True)
    print(res)

    res = subprocess.call('/usr/bin/ssh -o "StrictHostKeyChecking=no" %s "/usr/sbin/qm start %s"'%(metal, vmid), shell=True)
    print(res)

    return "OK"

@app.route('/init/')
def initWorkspace():
    ip = request.json["ip"]
    packages = request.json["packages"]
    
    res = subprocess.call('/usr/bin/ssh -o "StrictHostKeyChecking=no" %s "apt-get install -y %s"'%(ip, packages), shell=True)
    print(res)
    return "OK"

@app.route('/addUser/')
def addUser():
    ip = request.json["ip"]
    user = request.json["user"]
    port = request.json["port"]
    password = request.json["password"]
    
    screen = int(port)-5900
    res = subprocess.call('/usr/bin/ssh -o "StrictHostKeyChecking=no" %s "/usr/sbin/useradd -m %s -s /bin/bash"'%(ip, user), shell=True)
    print(res)


    systemdFile = '''[Unit]
Description=TigerVNC Server Startup
After=syslog.target network.target

[Service]
Type=forking
User={0}
Group={0}
WorkingDirectory=/home/{0}

ExecStartPre=-/usr/bin/vncserver -kill :%i > /dev/null 2>&1
ExecStart=/usr/bin/vncserver -depth 24 -geometry 1920x1080 -localhost no :%i
ExecStop=/usr/bin/vncserver -kill %i

[Install]
WantedBy=multi-user.target'''.format(user)
    res = subprocess.call('/usr/bin/ssh -o "StrictHostKeyChecking=no" %s "echo \\"%s\\" > /etc/systemd/system/vncserver-%s@.service"'%(ip, systemdFile, user), shell=True)
    print(res)

    res = subprocess.call('/usr/bin/ssh -o "StrictHostKeyChecking=no" %s "su - %s -c \\"cd && mkdir .vnc && chmod go-rwx .vnc && cp /public/vncpasswd .vnc/passwd && chmod 600 .vnc/passwd && touch .Xauthority\\""'%(ip, user), shell=True)
    print(res)

    res = subprocess.call('/usr/bin/ssh -o "StrictHostKeyChecking=no" %s "echo %s:%s | chpasswd"'%(ip, user, password), shell=True)
    print(res)

    res = subprocess.call('/usr/bin/ssh -o "StrictHostKeyChecking=no" %s "/bin/systemctl daemon-reload"'%(ip), shell=True)
    print(res)

    res = subprocess.call('/usr/bin/ssh -o "StrictHostKeyChecking=no" %s "/bin/systemctl enable vncserver-%s@%s"'%(ip, user, screen), shell=True)
    print(res)

    res = subprocess.call('/usr/bin/ssh -o "StrictHostKeyChecking=no" %s "/bin/systemctl start vncserver-%s@%s"'%(ip, user, screen), shell=True)
    print(res)

    res = subprocess.call('/usr/bin/ssh -o "StrictHostKeyChecking=no" {0} "snap set novnc services.n{2}.listen={2} services.n{2}.vnc={1}:{2}"'.format(metal, ip, port), shell=True)
    print(res)

    #res = subprocess.call('/usr/bin/ssh -o "StrictHostKeyChecking=no" %s "/usr/sbin/iptables -t nat -A PREROUTING -i vmbr0 -d 45.76.75.118 -p tcp --dport %s -j DNAT --to %s:%s"'%(metal, port, ip, port), shell=True)
    #print(res)
    return "OK"

@app.route('/removeUser/')
def removeUser():
    ip = request.json["ip"]
    user = request.json["user"]
    port = request.json["port"]
    
    screen = int(port)-5900
    res = subprocess.call('/usr/bin/ssh -o "StrictHostKeyChecking=no" %s "/bin/systemctl disable vncserver-%s@%s"'%(ip, user, screen), shell=True)
    print(res)

    res = subprocess.call('/usr/bin/ssh -o "StrictHostKeyChecking=no" %s "/bin/systemctl kill vncserver-%s@%s"'%(ip, user, screen), shell=True)
    print(res)

    res = subprocess.call('/usr/bin/ssh -o "StrictHostKeyChecking=no" %s "rm /etc/systemd/system/vncserver-%s@.service"'%(ip, user), shell=True)
    print(res)

    res = subprocess.call('/usr/bin/ssh -o "StrictHostKeyChecking=no" %s "/usr/sbin/userdel -fr %s"'%(ip, user), shell=True)
    print(res)

    res = subprocess.call('/usr/bin/ssh -o "StrictHostKeyChecking=no" {0} "snap set novnc services.n{1}.listen='' services.n{1}.vnc=''"'.format(metal, port), shell=True)
    print(res)

    return "OK"
